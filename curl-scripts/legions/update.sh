curl "http://localhost:4741/legions/${ID}" \
  --include \
  --request PATCH \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "game": {
      "title": "'"${TITLE}"'",
      "releaseDate": "'"${DATE}"'",
      "genre": "'"${GENRE}"'",
      "platform": "'"${PLATFORM}"'"
    }
  }'
