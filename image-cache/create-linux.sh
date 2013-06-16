export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8

/usr/bin/xvfb-run --auto-servernum --server-args="-screen 0, 1024x768x24" image-cache/CutyCapt --url="$1" --max-wait=30000 --java=off --plugin=off --js-can-open-window=off --out=image.png

if [ -f "image.png" ];
then
  echo "move image.png to $4"
  mv image.png "$4"
else
  echo "generation failed"
fi



