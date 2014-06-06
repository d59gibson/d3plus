//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Creates a data object for the Tooltip
//------------------------------------------------------------------------------
d3plus.tooltip.data = function(vars,id,length,extras,children,depth) {

  if (vars.small) {
    return []
  }

  if (!length) var length = "long"
  if (length == "long") {
    var other_length = "short"
  }
  else {
    var other_length = "long"
  }

  var extra_data = {}
  if (extras && typeof extras == "string") extras = [extras]
  else if (extras && typeof extras == "object") {
    extra_data = d3plus.object.merge(extra_data,extras)
    var extras = []
    for ( var k in extra_data ) {
      extras.push(k)
    }
  }
  else if (!extras) var extras = []

  var tooltip_highlights = []

  if (vars.tooltip.value instanceof Array) {
    var a = vars.tooltip.value
  }
  else if (typeof vars.tooltip.value == "string") {
    var a = [vars.tooltip.value]
  }
  else {

    if (vars.tooltip.value[vars.id.nesting[depth]]) {
      var a = vars.tooltip.value[vars.id.nesting[depth]]
    }
    else {
      var a = vars.tooltip.value
    }

    if (!(a instanceof Array)) {

      if (a[length]) {
        a = a[length]
      }
      else if (a[other_length]) {
        a = []
      }
      else {
        a = d3plus.object.merge({"":[]},a)
      }

    }

    if (typeof a == "string") {
      a = [a]
    }
    else if (!(a instanceof Array)) {
      a = d3plus.object.merge({"":[]},a)
    }

  }

  function format_key(key,group) {
    if (vars.attrs.value[group]) var id_var = group
    else var id_var = null

    if (group) group = vars.format.value(group)

    var value = extra_data[key] || d3plus.variable.value(vars,id,key,id_var)

    if (value !== false && value !== null) {
      var name = vars.format.locale.value.ui[key]
               ? vars.format.value(vars.format.locale.value.ui[key])
               : vars.format.value(key),
          h = tooltip_highlights.indexOf(key) >= 0

      var val = vars.format.value(value,key)

      var obj = {"name": name, "value": val, "highlight": h, "group": group}

      if ( vars.descs.value ) {

        if ( typeof vars.descs.value === "function" ) {
          var descReturn = vars.descs.value( key )
          if ( typeof descReturn === "string" ) {
            obj.desc = descReturn
          }
        }
        else if ( key in vars.descs.value ) {
          obj.desc = vars.descs.value[key]
        }

      }

      if (val) tooltip_data.push(obj)
    }

  }

  var tooltip_data = []
  if (a instanceof Array) {

    extras.forEach(function(e){
      if (a.indexOf(e) < 0) a.push(e)
    })

    a.forEach(function(t){
      format_key(t)
    })

  }
  else {

    if (vars.id.nesting.length && depth < vars.id.nesting.length-1) {
      var a = d3plus.util.copy(a)
      vars.id.nesting.forEach(function(n,i){
        if (i > depth && a[n]) delete a[n]
      })
    }

    if (vars.tooltip.value.long && typeof vars.tooltip.value.long == "object") {
      var placed = []
      for ( var group in vars.tooltip.value.long ) {

        extras.forEach(function(e){
          if (vars.tooltip.value.long[group].indexOf(e) >= 0 && ((a[group] && a[group].indexOf(e) < 0) || !a[group])) {
            if (!a[group]) a[group] = []
            a[group].push(e)
            placed.push(e)
          }
          else if (a[group] && a[group].indexOf(e) >= 0) {
            placed.push(e)
          }
        })
      }
      extras.forEach(function(e){
        if (placed.indexOf(e) < 0) {
          if (!a[""]) a[""] = []
          a[""].push(e)
        }
      })
    }
    else {

      var present = []

      for ( var group in a ) {
        extras.forEach(function(e){
          if (a[group] instanceof Array && a[group].indexOf(e) >= 0) {
            present.push(e)
          }
          else if (typeof a[group] == "string" && a[group] == e) {
            present.push(e)
          }
        })
      }

      if (present.length != extras.length) {
        if (!a[""]) a[""] = []
        extras.forEach(function(e){
          if (present.indexOf(e) < 0) {
            a[""].push(e)
          }
        })
      }

    }

    if (a[""]) {
      a[""].forEach(function(t){
        format_key(t,"")
      })
      delete a[""]
    }

    for ( var group in a ) {
      if (a[group] instanceof Array) {
        a[group].forEach(function(t){
          format_key(t,group)
        })
      }
      else if (typeof a[group] == "string") {
        format_key(a[group],group)
      }
    }

  }

  if ( children ) {

    var title  = vars.format.locale.value.ui.including
      , colors = children.d3plus_colors

    for ( var child in children ) {

      if ( child !== "d3plus_colors" ) {

        if ( child === "d3plusMore" ) {

          var more = vars.format.locale.value.ui.more
            , name = d3plus.string.format(more,children[child])
            , highlight = true
          children[child] = ""

        }
        else {
          var name = child
            , highlight = colors && colors[name] ? colors[name] : false
        }

        tooltip_data.push({
          "group": vars.format.value(title),
          "highlight": highlight,
          "name": name,
          "value": children[child]
        })

      }

    }
  }

  if ( length === "long" ) {

    var connections = vars.edges.connections( id[vars.id.value] , vars.id.value , true )

    if ( connections.length ) {
      connections.forEach(function(c){

        var name = d3plus.variable.text(vars,c)[0],
            color = d3plus.variable.color(vars,c),
            size = vars.tooltip.font.size,
            radius = vars.shape.value == "square" ? 0 : size
            styles = [
              "background-color: "+color,
              "border-color: "+d3plus.color.legible(color),
              "border-style: solid",
              "border-width: "+vars.data.stroke.width+"px",
              "display: inline-block",
              "height: "+size+"px",
              "left: 0px",
              "position: absolute",
              "width: "+size+"px",
              "top: 0px",
              d3plus.prefix()+"border-radius: "+radius+"px",
            ]
            node = "<div style='"+styles.join("; ")+";'></div>"

        tooltip_data.push({
          "group": vars.format.value(vars.format.locale.value.ui.primary),
          "highlight": false,
          "name": "<div style='position:relative;padding-left:"+size*1.5+"px;'>"+node+name+"</div>",
          "value": ""
        })
        
      })
    }

  }

  return tooltip_data

}
