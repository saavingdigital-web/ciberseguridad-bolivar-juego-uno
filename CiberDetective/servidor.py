"""Servidor local de desarrollo para CiberDetective (sin caché, para ver siempre los cambios).

Uso, desde esta carpeta:   py servidor.py      ->  http://localhost:8130
"""
import http.server
import os
import sys

PUERTO = int(sys.argv[1]) if len(sys.argv) > 1 else 8130


class SinCache(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      '.js': 'text/javascript', '.mjs': 'text/javascript', '.glb': 'model/gltf-binary',
                      '.woff2': 'font/woff2', '.wasm': 'application/wasm'}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()


if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    print(f'CiberDetective en http://localhost:{PUERTO}')
    http.server.ThreadingHTTPServer(('127.0.0.1', PUERTO), SinCache).serve_forever()
