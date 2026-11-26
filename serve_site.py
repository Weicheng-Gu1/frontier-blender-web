"""Serve the same static Astro build used by GitHub Pages at the IP preview."""
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

BUILD = Path(__file__).resolve().parent / "dist"
BASE = "/frontier-blender-web"


class SiteHandler(SimpleHTTPRequestHandler):
    def send_head(self):
        request = urlsplit(self.path)
        path = request.path
        if path.startswith("/task/") and len(path.strip("/").split("/")) == 2:
            target = BASE + path.rstrip("/") + "/"
            self.send_response(302)
            self.send_header("Location", urlunsplit(("", "", target, request.query, "")))
            self.end_headers()
            return None
        if path == BASE or path.startswith(BASE + "/"):
            path = path[len(BASE):] or "/"
        path = {"/tasks": "/task/", "/tasks/": "/task/", "/task-atlas.html": "/task/",
                "/blog": "/", "/blog/": "/"}.get(path, path)
        self.path = urlunsplit(("", "", path, request.query, ""))
        return super().send_head()

    def list_directory(self, path):
        self.send_error(404)
        return None


if __name__ == "__main__":
    handler = partial(SiteHandler, directory=str(BUILD))
    with ThreadingHTTPServer(("127.0.0.1", int(os.environ.get("PORT", "8088"))), handler) as server:
        server.serve_forever()
