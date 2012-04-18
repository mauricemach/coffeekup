header ->
    h1 ->
        "Helpers compiled from file (see templates/helpers)"
div ->
    wrap ->
        "This is wrapped content"
    textbox id:"#{@id}", value:"#{@value}", label:"#{@label}"
