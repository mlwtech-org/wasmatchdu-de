import urllib.request

urls = [
    "https://skynews-live.akamaized.net/hls/live/2002347/skynews-international/master.m3u8",
    "https://live-hls-web-aje.getaj.net/AJE/index.m3u8",
    "https://news.cgtn.com/resource/live/english/cgtn-news.m3u8",
    "https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8",
    "https://ntv1.akamaized.net/hls/live/2014075/NASA-NTV1-HLS/master.m3u8"
]

for url in urls:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req, timeout=5)
        print(f"OK (200): {url}")
    except Exception as e:
        print(f"FAILED: {url} - {e}")
