while true; do
  HASH=$(cat /dev/urandom | tr -dc 'a-f0-9' | head -c 64)
  SPEED=$(awk -v min=500 -v max=9999 'BEGIN{srand(); printf "%.2f", min+rand()*(max-min)}')
  echo -e "\e[93m[XMR]\e[0m $HASH | \e[92m${SPEED} MH/s\e[0m"
doneআমি একটা একটা পেস্ট করতে পারবোনা। তুমি full Json work flow templates দাওwhile true; do
  HASH=$(cat /dev/urandom | tr -dc 'a-f0-9' | head -c 64)
  SPEED=$(awk -v min=500 -v max=9999 'BEGIN{srand(); printf "%.2f", min+rand()*(max-min)}')
  echo -e "\e[93m[XMR]\e[0m $HASH | \e[92m${SPEED} MH/s\e[0m"
done