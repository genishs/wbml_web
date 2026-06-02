# 개발용 정적 서버 — ES 모듈 캐시 문제 방지(매 요청 no-store)
import http.server, socketserver

PORT = 8000

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

NoCacheHandler.extensions_map['.js'] = 'text/javascript'

socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(('127.0.0.1', PORT), NoCacheHandler) as httpd:
    print(f'dev server (no-cache) on http://127.0.0.1:{PORT}')
    httpd.serve_forever()
