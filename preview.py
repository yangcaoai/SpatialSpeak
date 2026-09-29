"""Local static preview with byte-range support for video seeking."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import re


class PreviewHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        self.byte_range = None
        header = self.headers.get('Range')
        path = Path(self.translate_path(self.path))
        if not header or not path.is_file():
            return super().send_head()
        match = re.fullmatch(r'bytes=(\d*)-(\d*)', header.strip())
        size = path.stat().st_size
        if not match or not size:
            self.send_error(416, 'Unsupported byte range')
            return None
        first, last = match.groups()
        if not first and not last:
            self.send_error(416, 'Invalid byte range')
            return None
        start = int(first) if first else max(0, size - int(last))
        end = min(int(last), size - 1) if first and last else size - 1
        if start > end or start >= size:
            self.send_response(416)
            self.send_header('Content-Range', f'bytes */{size}')
            self.send_header('Content-Length', '0')
            self.end_headers()
            return None
        source = path.open('rb')
        source.seek(start)
        self.byte_range = end - start + 1
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(str(path)))
        self.send_header('Content-Length', str(self.byte_range))
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.end_headers()
        return source

    def end_headers(self):
        self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def copyfile(self, source, outputfile):
        try:
            if self.byte_range is None:
                return super().copyfile(source, outputfile)
            remaining = self.byte_range
            while remaining:
                data = source.read(min(65536, remaining))
                if not data:
                    break
                outputfile.write(data)
                remaining -= len(data)
        except (BrokenPipeError, ConnectionResetError):
            pass


if __name__ == '__main__':
    directory = str(Path(__file__).resolve().parent)
    server = ThreadingHTTPServer(('127.0.0.1', 8765), partial(PreviewHandler, directory=directory))
    print('SpatialSpeak preview: http://127.0.0.1:8765/', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
