# StocKs API
#### This is a NodeJs app that retuns realtime stock ticker prices


## Depeendencies
- Docker
- NodeJs
- Express
- MongoDb 
- Swagger 


## Structure
- This app is made up of three 3 docker images linked to each other (db [mongodb ], app [nodeJs +express for users interaction] and adapter [Nodejs which sources the stock data and logs to db])

### Setup and running project

Project can be setup and started using `docker-compose up`

## Previewing
- Once the app is started, go to the browser
http://localhost:5000/api-docs to see the available endpoints which are.
	- /symbols (which returns all the available company symbols [for test, i have only 5 symbols in symbols.json])
	- /series/:symbol (which returns the last most rescent tickers for a given symbol)

### TODOs
- Change the task scheduling system from using cron to an AMPQ messaging system. 

Thank you 