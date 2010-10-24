doctype 5
html ->
  head ->
    title 'Meryl example'
  body ->
#    text '\n------------------\n'
#    text @render
#    text '\n------------------\n'
#    text inspect @content
#    text '\n------------------\n'
#    text inspect @context
    @render @content, @context
