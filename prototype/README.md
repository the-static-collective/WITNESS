# WITNESS browser prototype

No build step and no dependencies.

Serve this directory over HTTPS (or localhost) so the browser can request microphone access.

For a quick local test:

```sh
python3 -m http.server 8080 --directory prototype
```

Then open `http://localhost:8080`.

On phones, deploy the repository with GitHub Pages or another HTTPS static host.

The app stores recordings in IndexedDB on the current device. Use **Export WITNESS package** and **Import partner package** to merge two readers without a backend.
