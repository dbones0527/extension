clean:
	rm -rf build

firefox:
	mkdir build
	mkdir build/firefox
	cp -r common/* build/firefox/
	cp -rf firefox/* build/firefox/

chromium:
	mkdir build
	mkdir build/chromium
	cp -r common/* build/chromium/
	cp -rf chromium/* build/chromium/
