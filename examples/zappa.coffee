get '/': ->
  @people = ['bob', 'alice', 'sinatra', 'zappa']
  render 'default'

view ->
  @title = 'Zappa example'
  h1 @title
  ul ->
    for p in @people
      li p
