import json, re, sys
html = sys.stdin.read()
match = re.search(r'id="ssr-end">.*?<script id="__LOADABLE_REQUIRED_CHUNKS__".*?</script>.*?(<script.*?>.*?</script>)', html, re.DOTALL)
if match:
    # Actually wait, there is a better way. Let's look for "props":{"page":{"title":"Get Token"
    pass
