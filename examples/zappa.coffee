get '/': -> render 'default'

view ->
  @title = 'Zappa example'
  h1 @title
