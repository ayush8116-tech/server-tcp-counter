```js
innings : 
{
  "0": [
    {
      "over": 0,
      "deliveries": []
    }
  ],
  "summary": {
    "over": 0,
    "total": 0,
    "inning": 0,
    "target": 0
  }
}
```

request will come from browser
i will get pathname from request url
i will get how many runs i need to add -- that should be the only work from request handler 
it will just call the score adder with how many runs came on this ball . (0, 1, 2, 3, 4, 5, 6)
score adder handler will call the generate delivery
generate delivery will call the main score manager where the data will modified and provide the data which we have to show.

request handler will just replace the value in data string and attach it in response body


input : 
