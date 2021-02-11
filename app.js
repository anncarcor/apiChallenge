const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");

const app = express(); 

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


//GET routes home and about
app.get("/", function(req, res){
    res.render("home");
});

app.get("/about", function(req, res){
    res.render("about");
});

app.get("/oops", function(req, res){
    res.render("oops");
});

//GET routes for API calls per category, gloves, facemasks and beanies
app.get("/gloves", function(req, res){

    https.get("https://bad-api-assignment.reaktor.com/v2/products/gloves", function(response){
        let data = '';

        response.on("data", function(chunk){
            data += chunk;
        });

        response.on("end", function(){

            const glovesData = JSON.parse(data)
            const gloveID = glovesData.id;
            const gloveManu = glovesData.manufacturer;

            res.render("gloves", {glovesData: glovesData});



        })
    });
});


app.get("/facemasks", function(req, res){

    https.get("https://bad-api-assignment.reaktor.com/v2/products/facemasks", function(response){
        let data = '';

        response.on("data", function(chunk){
            data += chunk;
        });

        response.on("end", function(){
            const facemaskData = JSON.parse(data)
            res.render("facemasks", {facemaskData: facemaskData});
        })
    });
});

app.get("/beanies", function(req, res){

    https.get("https://bad-api-assignment.reaktor.com/v2/products/beanies", function(response){
        let data = '';

        response.on("data", function(chunk){
            data += chunk;
        });

        response.on("end", function(){
            const beanieData = JSON.parse(data)
            res.render("beanies", {beanieData: beanieData});
        })
    });
});


app.get("/:availability/:itemID", function (req, res){

    const manufacturer = req.params.availability;
    const itemID = _.toUpper(req.params.itemID);
    
    https.get("https://bad-api-assignment.reaktor.com/v2/availability/" + manufacturer, function(response){
        let data = '';

        response.on("data", function(chunk){
            data += chunk;
        });

        response.on("end", function(err){

            if (!err){
            const manuData = JSON.parse(data);

            //filter out the searched for product
            let result = _.find(manuData.response, function(obj) { 
                if (obj.id = itemID) { 
                    return true; 
                } 
            }); 

            // consts to hold the id and data in searched result
            const resID = result.id;
            const resAvail = result.DATAPAYLOAD;

            let regexp = /UE>(.*?)</; 
            let matchAll = resAvail.match(regexp)[1]; 

            res.render("availability",  
                {result,
                manufacturer: manufacturer,
                id: resID,
                data: matchAll});
        }  else {
            res.redirect("oops");
        } } 

        );

    });

});

//POST route for category, gloves, facemasks and beanies
app.post("/", function (req, res){

    if(req.body.selectItem === "gloves"){
        res.redirect("gloves");
    } else if (req.body.selectItem === "facemasks"){
        res.redirect("facemasks");
    } else if (req.body.selectItem === "beanies"){
        res.redirect("beanies");
    } else {
        res.redirect("/");
    }

});

//Post route to get manufacturer and prod id to check stock level
app.post("/availability", function(req, res){

    const itemID = req.body.itemID; 
    const availability = req.body.checkAvailibilty;
    res.redirect("/" + availability + "/" + itemID);
});







let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function(){
    console.log("Server is running on port 3000");
})
