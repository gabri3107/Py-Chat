(function() {
    'use strict';

    
    //Instacia do pusher
    var pusher = new Pusher('05b9a4be85d4078be821', {
        authEndpoint: '/pusher/auth',
        cluster: 'us2',
        encrypted: true
      });

    //Detalhes do usuário do chat
    let chat = {
        name:  undefined,
        email: undefined,
        myChannel: undefined,
    }

    const chatPage   = $(document)
    const chatWindow = $('.chatbubble')
    const chatHeader = chatWindow.find('.unexpanded')
    const chatBody   = chatWindow.find('.chat-window')


    // ----------------------------------------------------
    // Register helpers
    // ----------------------------------------------------

    let helpers = {

    ToggleChatWindow: function () {
            chatWindow.toggleClass('opened')
            chatHeader.find('.title').text(
                chatWindow.hasClass('opened') ? 'Minimizar' : 'Converse com o gato do suporte'
            )
        },

        //Mostra a janela apropriada para o chat (Login ou chat)
        ShowAppropriateChatDisplay: function () {
            (chat.name) ? helpers.ShowChatRoomDisplay() : helpers.ShowChatInitiationDisplay()
        },

   
        //Função para o login    
        ShowChatInitiationDisplay: function () {
            chatBody.find('.chats').removeClass('active')
            chatBody.find('.login-screen').addClass('active')
        },

  
        //Função chat ativo
        ShowChatRoomDisplay: function () {
            chatBody.find('.chats').addClass('active')
            chatBody.find('.login-screen').removeClass('active')

            setTimeout(function(){
                chatBody.find('.loader-wrapper').hide()
                chatBody.find('.input, .messages').show()
            }, 2000)
        },

        
        //Append das mensagens na janela do chat
        NewChatMessage: function (message) {
            if (message !== undefined) {
                const messageClass = message.sender !== chat.email ? 'support' : 'user'

                chatBody.find('ul.messages').append(
                    `<li class="clearfix message ${messageClass}">
                        <div class="sender">${message.name}</div>
                        <div class="message">${message.text}</div>
                    </li>`
                )


                chatBody.scrollTop(chatBody[0].scrollHeight)
            }
        },

        //Envia a mensagem para o canal do chat
        SendMessageToSupport: function (evt) {

            evt.preventDefault()

            let createdAt = new Date()
            createdAt = createdAt.toLocaleString()

            const message = $('#newMessage').val().trim()

            chat.myChannel.trigger('client-guest-new-message', {
                'sender': chat.name,
                'email': chat.email,
                'text': message,
                'createdAt': createdAt
            });

            helpers.NewChatMessage({
                'text': message,
                'name': chat.name,
                'sender': chat.email
            })

            console.log("Mensagem enviada!!!!!")

            $('#newMessage').val('')
        },

    
        //Loga o usuário na sessão do canal    
        LogIntoChatSession: function (evt) {
            const name  = $('#fullname').val().trim()
            const email = $('#email').val().trim().toLowerCase()

            //Disabilita a tela de login
            chatBody.find('#loginScreenForm input, #loginScreenForm button').attr('disabled', true)

            if ((name !== '' && name.length >= 3) && (email !== '' && email.length >= 5)) {
                axios.post('/new/guest', {name, email}).then(response => {
                    chat.name = name
                    chat.email = email
                    chat.myChannel = pusher.subscribe('private-' + response.data.email);
                    helpers.ShowAppropriateChatDisplay()
                })
            } else {
                alert('Insira um nome e emails validos!')
            }

            evt.preventDefault()
        }
    }

   
    //Recebe a mensagem do admin
    pusher.bind('client-support-new-message', function(data){
        helpers.NewChatMessage(data)
    })


   
    //Listeners
    chatPage.ready(helpers.ShowAppropriateChatDisplay)
    chatHeader.on('click', helpers.ToggleChatWindow)
    chatBody.find('#loginScreenForm').on('submit', helpers.LogIntoChatSession)
    chatBody.find('#messageSupport').on('submit', helpers.SendMessageToSupport)
}())
