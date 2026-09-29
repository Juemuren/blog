local function url_encode(str)
  if not str then return "" end
  str = string.gsub(str, "([^%w_.~-])", function(c)
    return string.format("%%%02X", string.byte(c))
  end)
  return str
end

local function escape_html(str)
  local escapes = {
    ["&"] = "&amp;",
    ["<"] = "&lt;",
    [">"] = "&gt;",
    ['"'] = "&quot;",
    ["'"] = "&#39;"
  }
  return string.gsub(str, "[&<>\"']", escapes)
end

-- Convert Math Elements to Zhihu Img Tag
function Math(el)
  local tex = el.text
  local encoded_tex = url_encode(tex)
  local escaped_alt = escape_html(tex)
  local ee_img = "1"
  if el.mathtype == "DisplayMath" then
    ee_img = "2"
  end
  local html = string.format(
    '<img src="https://www.zhihu.com/equation?tex=%s" alt="%s" class="ee_img tr_noresize" eeimg="%s">',
    encoded_tex, escaped_alt, ee_img
  )
  return pandoc.RawInline('html', html)
end
