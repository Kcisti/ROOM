document.getElementById('room').style.display='none';
function connect(connect){
  document.getElementById('log').style.display='none';
  document.getElementById('room').style.display='block';
  var membrana = document.getElementById('login_input').value;
  console.log(membrana);

  const CLIENT_ID = 'EFslC1FFGukiWwqQ';
  const drone = new ScaleDrone(CLIENT_ID, {
    data: { name: membrana}
  });

  let members = [];

  drone.on('open', error => {
    if (error) {
      return console.error(error);
    }
    console.log('Successfully connected to Scaledrone');

    const room = drone.subscribe('observable-room');
    room.on('open', error => {
      if (error) {
        return console.error(error);
      }
      console.log('Successfully joined room');
    });

    room.on('members', m => {
      members = m;
      updateMembersDOM();
    });

    room.on('member_join', member => {
      members.push(member);
      updateMembersDOM();
    });

    room.on('member_leave', ({id}) => {
      const index = members.findIndex(member => member.id === id);
      members.splice(index, 1);
      updateMembersDOM();
    });

    room.on('data', (text, member) => {
      if (member) {
        addMessageToListDOM(text, member);
      } else {
        // Message is from server
      }
    });
  });

  const DOM = {
    membersCount: document.querySelector('.members-count'),
    messages: document.querySelector('.messages'),
    input: document.querySelector('.message-form__input'),
    form: document.querySelector('.message-form'),
  };

  DOM.form.addEventListener('submit', sendMessage);

  function sendMessage() {
    const value = DOM.input.value;
    if (value === '') {
      return;
    }
    DOM.input.value = '';
    drone.publish({
      room: 'observable-room',
      message: value,
    });
  }

  function createMessageElement(text, member) {
    var {name} = member.clientData;
    const el = document.createElement('div');
    console.log(text);
    el.innerText= name.toUpperCase() + ' ' +text;
    el.className = 'message';
    console.log(el.innerText.  length);
    return el;
  }

  function addMessageToListDOM(text, member) {
    const el = DOM.messages;
    const wasTop = el.scrollTop === el.scrollHeight - el.clientHeight;
    el.appendChild(createMessageElement(text, member));
    if (wasTop) {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    }
  }

  function updateMembersDOM() {
    DOM.membersCount.innerText = `${members.length} users in room`;
  }


}
