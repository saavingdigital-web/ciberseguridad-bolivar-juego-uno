# Genera los audios del juego con la voz de Windows en español (Microsoft Sabina) y los comprime a MP3 con ffmpeg.
# Lee herramientas/textos_audio.json y escribe en audio/ (mensajes/, retro/, bienvenida, instrucciones, dinámicas, cierre y duraciones.json).
# Uso (desde la carpeta CiberEscudo_XR):   powershell -ExecutionPolicy Bypass -File herramientas\generar_audios.ps1
Add-Type -AssemblyName System.Speech
$raiz = Split-Path -Parent $PSScriptRoot
$json = Get-Content (Join-Path $raiz "herramientas\textos_audio.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$ffmpeg = (Get-Command ffmpeg -ErrorAction SilentlyContinue).Source
$ffprobe = (Get-Command ffprobe -ErrorAction SilentlyContinue).Source
if (-not $ffmpeg) { throw "No se encontró ffmpeg en el PATH." }

$voz = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voz.SelectVoice("Microsoft Sabina Desktop")
$voz.Rate = 0
$voz.Volume = 100

$tmp = Join-Path $env:TEMP "ce_voz"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

$duraciones = [ordered]@{}
$n = 0

foreach ($p in $json.PSObject.Properties) {
  $wav = Join-Path $tmp "voz.wav"
  $destino = Join-Path $raiz ("audio\" + ($p.Name -replace '/', '\') + ".mp3")
  New-Item -ItemType Directory -Force -Path (Split-Path $destino) | Out-Null
  
  $voz.SetOutputToWaveFile($wav)
  $voz.Speak([string]$p.Value)
  $voz.SetOutputToNull()
  
  & $ffmpeg -y -loglevel error -i $wav -ac 1 -ar 24000 -b:a 48k $destino
  
  if ($ffprobe) {
    $durStr = & $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $destino
    $durNum = [math]::Round([double]$durStr, 2)
    $duraciones[$p.Name] = $durNum
  }
  $n++
}

if ($duraciones.Count -gt 0) {
  $durPath = Join-Path $raiz "audio\duraciones.json"
  $durJson = $duraciones | ConvertTo-Json -Depth 4
  [System.IO.File]::WriteAllText($durPath, $durJson, [System.Text.Encoding]::UTF8)
  Write-Host "duraciones.json actualizado con exito."
}

Write-Host "Audios generados con exito: $n"
