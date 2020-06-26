const express = require('express');

const app = express();
 var bodyParser = require('body-parser');

var cors = require('cors');
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(urlencodedParser);
const Sequelize = require("sequelize");
const sequelize = new Sequelize("unique_filter_db", "root", "", {
    dialect: "mysql",
    host: "localhost"
});





const Contact = sequelize.define('contact', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,

    },
    name:{
        type: Sequelize.STRING,

    },
    data:{
        type: Sequelize.DATE
    },
    amount: {
        type:Sequelize.INTEGER
    },
    distanse:{
        type: Sequelize.INTEGER
    }

    
});
sequelize.sync().then(result => {
    console.log(result);
}).catch(err => console.log(err));



app.get('/all',async(req, res)=>{
    let all_contacts = await Contact.findAll({ raw: true });
    if(all_contacts.length){
        return res.json({
            error: false,
            body: all_contacts
        });
    }
    return res.json({
        error: true,
        message:'Не удалось найти ни одной записи'
    });
});

app.listen(8000, () => console.log('listening port 5000'))