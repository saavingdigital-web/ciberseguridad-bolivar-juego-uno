# Genera los audios del juego con la voz de Windows en español (Microsoft Sabina) y los comprime a MP3 con ffmpeg.
# Lee herramientas/textos_audio.json y escribe en audio/ (mensajes/, retro/ e instrucciones.mp3).
# Uso (desde la carpeta CiberEscudo_XR):   powershell -ExecutionPolicy Bypass -File herramientas\generar_audios.ps1
Add-Type -AssemblyName System.Speech
$raiz = Split-Path -Parent $PSScriptRoot
$json = Get-Content (Join-Path $raiz "herramientas\textos_audio.json") -Raw -Encoding UTF8 | ConvertFrom-Json
$ffmpeg = (Get-Command ffmpeg -ErrorAction SilentlyContinue).Source
if (-not $ffmpeg) { throw "No se encontró ffmpeg en el PATH." }
$voz = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voz.SelectVoice("Microsoft Sabina Desktop")
$voz.Rate = 0
$voz.Volume = 100
$tmp = Join-Path $env:TEMP "ce_voz"
New-Item -ItemType Directory -Force -Path $tmp | Out-Null
$n = 0
foreach ($p in $json.PSObject.Properties) {
  $wav = Join-Path $tmp "voz.wav"
  $destino = Join-Path $raiz ("audio\" + ($p.Name -replace '/', '\') + ".mp3")
  New-Item -ItemType Directory -Force -Path (Split-Path $destino) | Out-Null
  $voz.SetOutputToWaveFile($wav)
  $voz.Speak([string]$p.Value)
  $voz.SetOutputToNull()
  & $ffmpeg -y -loglevel error -i $wav -ac 1 -ar 24000 -b:a 40k $destino
  $n++
}
"Audios generados: $n"
