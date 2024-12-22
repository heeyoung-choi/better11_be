# API Usage Examples

## Authentication

### Login
- **URL**: `http://localhost:8000/auth/login`
- **Method**: `POST`
- **Sample Body**:
  ```json
  {
    "email": "quang@gmail.com",
    "password": "123456"
  }
  ```
   ```json
- **Response**::
 ```json
  {
    "message": "Login successful",
    "token": "token",
    "user": {
        "uid": "RBE0X1I9HBPFxF2mdRWX3IZv1L13",
        "email": "quang@gmail.com",
        "displayName": "Quang Duong"
    }
  }
  ```
### Register
- **URL**: `http://localhost:8000/auth/register`
- **Method**: `POST`
- **Sample Body**:
  ```json
  {
    "email": "email@gmail.com",
    "password": "pass>6digits",
    "displayName": "User Name"
  }
  ```
- **Response**::
 ```json
  {
    "message": "Login successful",
    "user": {
        "uid": "RBE0X1I9HBPFxF2mdRWX3IZv1L13",
        "email": "quang@gmail.com",
        "displayName": "Quang Duong"
    }
  }
  ```

## Predictions

### Predict
- **URL**: `http://localhost:8000/predictions/predict`
- **Method**: `POST`
- **Sample Body for Winner Prediction**:
  ```json
  {
    "userId": "user1234",
    "matchId": "match456",
    "type": "winner",
    "data": {
      "predictedWinner": "teamA"
    },
    "timestamp": "2024-12-20T12:34:56.789Z" // req dont need to include because it is auto generated
  }
  ```

- **Sample Body for Score Prediction**:
  ```json
  {
    "userId": "user456",
    "matchId": "match789",
    "type": "score",
    "data": {
      "predictedScore": {
        "teamA": 2,
        "teamB": 1
      }
    },
    "timestamp": "2024-12-20T12:34:56.789Z" // req dont need to include because it is auto generated
  }
  ```

- **Response**:
  ```json
    {
        "message": "Prediction saved successfully",
        "prediction": {
            "userId": "user456",
            "matchId": "match789",
            "type": "score",
            "data": {
                "predictedScore": {
                    "teamA": 2,
                    "teamB": 1
                }
            },
            "timestamp": "2024-12-21T13:01:33.879Z"
        }
    }
  ```
Or:
    console.error('Error saving prediction:', error.message);
### Retrieve
- **URL**: `http://localhost:8000/predictions/:userid`
- **Method**: `GET`
- **Get all predictions of user**

- **URL**: `http://localhost:8000/predictions/:userid/:matchid`
- **Method**: `GET`
- **Get all predictions of user of a certain match**

- **Response**:
  ```json
    {
        "predictions": [
            {
                "id": "Hwe4b8KUNMyY1ojlADls",
                "userId": "user0",
                "matchId": "match2",
                "type": "winner",
                "data": {
                    "predictedWinner": "teamC"
                },
                "timestamp": "2024-12-21T12:45:05.829Z"
            }
        ]
    }
  ```
Or: 
  ```json
    {
        "error": "No predictions found for this user and match."
    }
  ```
---
