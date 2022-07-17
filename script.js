document.getElementById('room').style.display='none';
const DOM = {
  membersCount: document.querySelector('.members-count'),
  messages: document.querySelector('.messages'),
  input: document.querySelector('.message-form__input'),
  form: document.querySelector('.message-form'),
};
DOM.input.style.display='none';
function connect(connect){
  document.getElementById('log').style.display='none';
  document.getElementById('room').style.display='block';
  DOM.input.style.display='block';
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
    const el = document.createElement('div');
    el.appendChild(createMemberElement(member));
    el.appendChild(document.createTextNode(text));
    el.className = 'message';
    return el;
  }

  function addMessageToListDOM(text, member) {
    const el = DOM.messages;
    el.appendChild(createMessageElement(text, member));
    el.scrollTop = el.scrollHeight - el.clientHeight;
  }

  function createMemberElement(member) {
    var {name} = member.clientData;
    const el = document.createElement('div');
    el.appendChild(document.createTextNode(name));
    el.className = 'member';
    return el;
  }

  function updateMembersDOM() {
    DOM.membersCount.innerText = `${members.length} users in room`;
  }


}
