wrap : (fn) ->
    p -> "==========Wrapper Start===>"
    div ->
        fn()
    p -> "<===Wrapper End============"
textbox : (attrs) ->
    wrap(->
        label for: "#{attrs.id}", -> "#{attrs.label}"
        input "##{attrs.id}", type:"text", value:"#{attrs.value}"
        )
