import {
  Card,
  CardContent,
  FormControl,
  MenuItem,
  Select,
} from "@material-ui/core"
import "leaflet/dist/leaflet.css"
import React, { useEffect, useState } from "react"
import "./App.css"
import InfoBox from "./Component/InfoBox"
import LineGraph from "./Component/LineGraph"
import Map from "./Component/Map"
import Table from "./Component/Table"
import "./InfoBox.css"
import { prettyPrintStat, sortData } from "./util"

function App() {
  const [countries, setCountries] = useState([])
  const [country, setCountry] = useState("worldwide")
  const [countryInfo, setCountryInfo] = useState({})
  const [tableData, setTableData] = useState([])
  const [mapCenter, setMapCenter] = useState([34.80746, -40.4796])
  const [zoom, setZoom] = useState(3)
  const [mapCountries, setMapCountries] = useState([])
  const [casesType, setCasesType] = useState("cases")
  const [isLoading, setLoading] = useState(false)

  const getWorldwideData = async () => {
    const response = await fetch("https://disease.sh/v3/covid-19/all")
    const data = await response.json()
    setCountryInfo(data)
  }

  useEffect(() => {
    getWorldwideData()
  }, [])

  const getCountriesData = async () => {
    await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response) => response.json())
      .then((data) => {
        const countries = data.map((country) => ({
          name: country.country,
          value: country.countryInfo.iso2,
        }))

        const sortedData = sortData(data)
        setTableData(sortedData)
        setMapCountries(data)
        setCountries(countries)
      })
  }
  useEffect(() => {
    getCountriesData()
  }, [])

  const onCountryChange = async (event) => {
    setLoading(true)
    const countryCode = event.target.value

    setCountry(countryCode)

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setCountry(countryCode)
        setCountryInfo(data)
        setLoading(false)
        countryCode === "worldwide"
          ? setMapCenter([34.80746, -40.4796])
          : setMapCenter([data.countryInfo.lat, data.countryInfo.long])
        setZoom(4)
      })
  }

  return (
    <div>
      <div className='app'>
        <div className='app__left'>
          <div className='app__header'>
            <h1>Covid-19 tracker</h1>
            <FormControl className='app__dropdown'>
              <Select
                variant='outlined'
                onChange={onCountryChange}
                value={country}
              >
                <MenuItem value='worldwide'>Worldwide</MenuItem>
                {countries.map((country) => (
                  <MenuItem value={country.value}>{country.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>

          <div className='app__stats'>
            <InfoBox
              isRed
              active={casesType === "cases"}
              className='infoBox__cases'
              onClick={(e) => setCasesType("cases")}
              title='Coronavirus Cases'
              total={prettyPrintStat(countryInfo.cases)}
              cases={prettyPrintStat(countryInfo.todayCases)}
              isloading={isLoading}
            />
            <InfoBox
              active={casesType === "recovered"}
              className='infoBox__recovered'
              onClick={(e) => setCasesType("recovered")}
              title='Recovered'
              total={prettyPrintStat(countryInfo.recovered)}
              cases={prettyPrintStat(countryInfo.todayRecovered)}
              isloading={isLoading}
            />
            <InfoBox
              isGrey
              active={casesType === "deaths"}
              className='infoBox__deaths'
              onClick={(e) => setCasesType("deaths")}
              title='Deaths'
              total={prettyPrintStat(countryInfo.deaths)}
              cases={prettyPrintStat(countryInfo.todayDeaths)}
              isloading={isLoading}
            />
          </div>
          {/* Map */}
          <Map
            countries={mapCountries}
            center={mapCenter}
            zoom={zoom}
            casesType={casesType}
          />
        </div>
        <Card className='app__right'>
          <CardContent>
            <h3>Live Cases Worldwide</h3>
            <Table countries={tableData} />
            <h3 className='app__graphTitle'>WorldWide new {casesType}</h3>
            <LineGraph className='app__graph' casesType={casesType} />
          </CardContent>
          {/* Table */}
          {/* Graph */}
        </Card>
      </div>
      <h1 className='footer'>Crafted by @Jyoti KM</h1>
    </div>
  )
}

export default App
