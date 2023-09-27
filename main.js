const socket = io('http://localhost:2501', {
    transports: ["polling", "websocket"],
    withCredentials: true
} 
);

$('#div-chat').hide();

socket.on('ListUserOnline', arrUserInfo => {
    $('#div-chat').show();
    $('#div-signup').hide();

    arrUserInfo.forEach(user => {
        const { name, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${name}</li>`);
    });
    
    socket.on('HadNewUser', user => {
        const { name, peerId } = user;
        $('#ulUser').append(`<li id="${peerId}">${name}</li>`);
    });

    socket.on('SomeoneHasDisconnect', peerId => {
        $(`#${peerId}`).remove();
    })
});

socket.on('SignUpFail', () => alert('Please chose another user!'));


function openStream() {
    const config = { audio: false, video: true};
    return navigator.mediaDevices.getUserMedia(config);
}

function playStream(idVideoTag, stream) {
    const video = document.getElementById(idVideoTag);
    video.srcObject = stream;
    video.play();
}

const peer = new Peer();
peer.on('open', id => {
    $('#my-peer').append(id)  
    $("#btnSignUp").click(() => {
      const username = $("#txtUserName").val();
      socket.emit("UserSignUp", { name: username, peerId: id });
    });
});

// Caller
// $('#btnCall').click(() => {
//     const id = $('#remoteId').val();
//     openStream()
//     .then(stream => {
//         playStream('localStream', stream);
//         call = peer.call(id, stream);
//         call.on('stream', remoteStream => 
//             playStream('remoteStream', remoteStream)
//         );
//     });
// });

peer.on('call', (call) => {
    openStream()
    .then(stream => {
        call.answer(stream);
        playStream('localStream', stream);
        call.on('stream', remoteStream => playStream('remoteStream', remoteStream));
    });
});

$('#ulUser').on('click', 'li', function() {
    const id = ($(this).attr('id'));
    openStream()
    .then(stream => {
        playStream('localStream', stream);
        call = peer.call(id, stream);
        call.on('stream', remoteStream => 
            playStream('remoteStream', remoteStream)
        );
    });
});