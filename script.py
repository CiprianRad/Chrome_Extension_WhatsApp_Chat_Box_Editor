import urllib.request, re
req = urllib.request.Request('https://www.reddit.com/r/whatsapp/comments/1lx3ic6/', headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'})
try:
    with urllib.request.urlopen(req) as response:
        html = response.read().decode('utf-8')
        images = set(re.findall(r'https://preview\.redd\.it/[^\s\"\'\?]+', html))
        for img in images: print(img)
except Exception as e:
    print('Error:', e)
