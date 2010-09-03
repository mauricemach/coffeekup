@title = 'Log In'

h1 @title

p "A local var: #{a_local_var}"
p "A context var: #{@a_context_var}"

form action: '/', method: 'post', ->
  div class: 'field', ->
    label for: 'username', -> 'Username: '
    input id: 'username', name: 'username'

  div class: 'field', ->
    label for: 'password', -> 'Password: '
    input id: 'password', name: 'password'
