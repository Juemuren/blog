-- Decreasing Heading Level
function Header(el)
  if el.level == 1 then
    return {}
  else
    el.level = el.level - 1
    return el
  end
end
