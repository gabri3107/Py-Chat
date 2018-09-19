(function () {
    'use strict';

   //Instacia do pusher
    var pusher = new Pusher('05b9a4be85d4078be821', {
        authEndpoint: '/pusher/auth',
        cluster: 'us2',
        encrypted: true
      });

    // Detalhes do chat
    let chat = {
        messages: [],
        currentRoom: '',
        currentChannel: '',
        subscribedChannels: [],
        subscribedUsers: []
    }

    //Acessa o canal do chat
    var generalChannel = pusher.subscribe('general-channel');

   
    // Elementos
    const chatBody = $(document)
    const chatRoomsList = $('#rooms')
    const chatReplyMessage = $('#replyMessage')

  
     const helpers = {


    clearChatMessages: () => $('#chat-msgs').html(''),

    // Adiciona as mensagens recebidas na tela

        displayChatMessage: (message) => {
            if (message.email === chat.currentRoom) {

                $('#chat-msgs').prepend(
                    `<tr>
                        <td>
                            <div class="sender">${message.sender} @ <span class="date">${message.createdAt}</span></div>
                            <div class="message">${message.text}</div>
                        </td>
                    </tr>`
                )
            }
        },

        
        // Trocar de conversa
        loadChatRoom: evt => {
            chat.currentRoom = evt.target.dataset.roomId
            chat.currentChannel = evt.target.dataset.channelId

            if (chat.currentRoom !== undefined) {
                $('.response').show()
                $('#room-title').text(evt.target.dataset.roomId)
            }

            evt.preventDefault()
            helpers.clearChatMessages()
        },

        //Resposta que será enviada
        replyMessage: evt => {
            evt.preventDefault()

            let createdAt = new Date()
            createdAt = createdAt.toLocaleString()

            const message = $('#replyMessage input').val().trim()

            chat.subscribedChannels[chat.currentChannel].trigger('client-support-new-message', {
                'name': 'Admin',
                'email': chat.currentRoom,
                'text': message,
                'createdAt': createdAt
            });

            helpers.displayChatMessage({
                'email': chat.currentRoom,
                'sender': 'Gato do Suporte',
                'text': message,
                'createdAt': createdAt
            })


            $('#replyMessage input').val('')
        },
    }


    //Evento que retorna os detalhes de quem enviou a mensagem
      generalChannel.bind('new-guest-details', function(data) {

        chat.subscribedChannels.push(pusher.subscribe('private-' + data.email));

        chat.subscribedUsers.push(data);

        //Renderiza a lista de usuários no canal
        $('#rooms').html("");
        chat.subscribedUsers.forEach(function (user, index) {

                $('#rooms').append(
                    `<li class="nav-item"><a data-room-id="${user.email}" data-channel-id="${index}" class="nav-link" href="#">${user.name}</a></li>`
                )
        })

      })


      //Evento que recebe as mensagens novas dos usuários
      pusher.bind('client-guest-new-message', function(data){
          helpers.displayChatMessage(data)
      })


   
    chatReplyMessage.on('submit', helpers.replyMessage)
    chatRoomsList.on('click', 'li', helpers.loadChatRoom)
}())
