helpers = 
    textbox : (attrs) ->
        label for:"#{attrs.id}", -> "#{attrs.id}"
        input "##{attrs.id}", type:"text"
