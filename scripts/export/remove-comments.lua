-- Remove Inline Comments
function RawInline(el)
  if el.format == "html" and el.text:match("^<!%-%-.*%-%->$") then
    return {}
  end
end

-- Remove Block Comments
function RawBlock(el)
  if el.format == "html" and el.text:match("^<!%-%-.*%-%->$") then
    return {}
  end
end
