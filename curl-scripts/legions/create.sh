curl "http://localhost:4741/legions" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "legion": {
      "title": "'"${TITLE}"'",
      "loyalty": "'"${LOYALTY}"'",
      "homeworld": "'"${HOMEWORLD}"'",
      "primarch": "'"${PRIMARCH}"'"
    }
  }'
