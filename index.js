const fs = require("fs");

const program = require("commander");
const AWS = require("aws-sdk");
try{
    AWS.config.loadFromPath(__dirname + "/config_local.json");
}catch(err){
    AWS.config.loadFromPath(__dirname + "/config.json");
}

const dynamoDB = new AWS.DynamoDB.DocumentClient();

program
  .version("0.0.1")
  .option("-t, --table [tablename]", "Add the table you want to output to csv")
  .option("-d, --describe")
  .option("-r, --region [regionname]")
  .option(
    "-e, --endpoint [url]",
    "Endpoint URL, can be used to dump from local DynamoDB"
  )
  .option("-p, --profile [profile]", "Use profile from your credentials file")
  .option("-m, --mfa [mfacode]", "Add an MFA code to access profiles that require mfa.")
  .option("-f, --file [file]", "Name of the file to be created")
  .option(
    "-ec --envcreds",
    "Load AWS Credentials using AWS Credential Provider Chain"
  )
  .option("-s, --size [size]", "Number of lines to read before writing.", 5000)
  .parse(process.argv);

const query = {
  TableName: program.table,
  Limit: 1000
};

async function scanData(query){
    return new Promise((resolve)=>{
        const returnData = {error: null, data: null};
        dynamoDB.scan(query, (error, data)=>{
            console.log(data);
            if(error){
                console.error('scanDataErr>>>', error.stack);
                returnData.error = new Error('scanDataErr');
                resolve(returnData);
                return;
            }
            returnData.data = {};
            if(data.Items){
                returnData.data['Items'] = data.Items;
            }
            if (data.LastEvaluatedKey) {
                returnData.data['next'] = data.LastEvaluatedKey;
            }
            resolve(returnData);
            return;
        });
    });
}

async function getAllData(){
    let dataList = [];
    let flag = true;
    while(flag){
        const scanResult = await scanData(query);
        if(scanResult.error){
            throw scanResult.error;
        }
        if(!scanResult.data.next){
            flag = false;
        }else{
            query.ExclusiveStartKey = scanResult.data.next;
        }
        if(scanResult.data.Items){
            dataList = dataList.concat(scanResult.data.Items);
        }
    }
    if(program.file){
        fs.writeFileSync(program.file, JSON.stringify(dataList));
    }else{
        console.log(dataList);
    }
    console.log(`down, the file%:{program.file} create successful!!`)
}

getAllData();
