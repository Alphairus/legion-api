curl "http://localhost:4741/legions/${ID}" \
  --include \
  --request PATCH \
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
