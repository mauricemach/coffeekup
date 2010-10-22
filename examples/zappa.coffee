get '/': ->
  @title = 'Zappa example'
  render 'default'

view ->
  h1 @title
