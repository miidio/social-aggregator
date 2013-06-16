export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
export LC_CTYPE=en_US.UTF-8

webkit2png --width 1027 --fullsize --filename=image "$1"

if [ -f "image-full.png" ];
then
  echo "move image-full.png to $4"
  mv image-full.png "$4"
else
  echo "generation failed"
fi



