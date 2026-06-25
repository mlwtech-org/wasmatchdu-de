import urllib.request

urls = [
    "https://news.cgtn.com/resource/live/english/cgtn-news.m3u8",
    "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8",
    "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
    "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Origin': 'https://wasmatchdu.web.app'})
        response = urllib.request.urlopen(req, timeout=5)
        cors = response.headers.get('Access-Control-Allow-Origin')
        print(f"OK (200): {url} | CORS: {cors}")
    except Exception as e:
        print(f"FAILED: {url} - {e}")
