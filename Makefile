clean:
	rm -rf build

firefox:
	rm -rf build/firefox
	mkdir build
	mkdir build/firefox
	cp -r source/common/* build/firefox/
	cp -rf source/firefox/* build/firefox/

chromium:
	rm -rf build/chromium
	mkdir build
	mkdir build/chromium
	cp -r source/common/* build/chromium/
	cp -rf source/chromium/* build/chromium/
