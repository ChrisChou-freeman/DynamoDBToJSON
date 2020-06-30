const fs = require('fs');

const data = fs.readFileSync('./JoyAccountUser.json');
const jsonData = JSON.parse(data);

const joyBasicData = fs.readFileSync('./JoyBasicDeviceTable.json');
const jsonJoyBasicData = JSON.parse(joyBasicData);

function getFaceBookUserCount(){
    let faceBookUsers = [];
    const dataObj = jsonData;
    for(let i=0;i<dataObj.length;i++){
        const element = dataObj[i];
        if(element.openid){
            // console.log(element);
            if(faceBookUsers.indexOf(element.openid)==-1) faceBookUsers.push(element);
        }
    }
    return {count: faceBookUsers.length, datas: faceBookUsers};
}

function getUserDevice(){
    const faceBookDatas = getFaceBookUserCount();
    const resultData = {
    }
    for(let i=0;i<faceBookDatas.datas.length;i++){
        const element = faceBookDatas.datas[i];
        const userid = element.UserID;
        resultData[userid] = {};
        resultData[userid]['DeviceNumber'] = 0;
        resultData[userid]['email'] = element.Profile.email;
        for(let j=0;j<jsonJoyBasicData.length;j++){
            const element2 = jsonJoyBasicData[j];
            if(userid==element2.userId){
                resultData[userid]['DeviceNumber'] += 1;
            }
        }
    }
    console.log('allUser:', jsonData.length);
    console.log('faceBookUserNumber:', faceBookDatas.count);
    console.log(resultData);
}

getUserDevice();
