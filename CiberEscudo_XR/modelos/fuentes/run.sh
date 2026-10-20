#!/bin/bash
cd "$(dirname "$0")"
"/c/Program Files/Blender Foundation/Blender 5.2/blender.exe" --background --factory-startup --python "$1.py" 2>&1 | grep -E "EXPORTADO|HOJA|Error|Traceback|line [0-9]+|Warning" | head -30
