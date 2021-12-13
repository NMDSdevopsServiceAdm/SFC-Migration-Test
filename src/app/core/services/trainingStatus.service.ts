import { Injectable } from '@angular/core';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class TrainingStatusService {
  readonly MISSING = 2;
  readonly EXPIRED = 3;
  readonly EXPIRING = 1;
  readonly ACTIVE = 0;

  public getAggregatedStatus(trainingRecords, expiresSoonAlertDate: string) {
    let expired = false;
    let expiring = false;
    let missing = false;
    let trainingStatus = 0;

    trainingRecords.forEach((training) => {
      trainingStatus = this.getTrainingStatus(training.expires, training.missing, expiresSoonAlertDate);
      switch (trainingStatus) {
        case this.MISSING: {
          missing = true;
          break;
        }
        case this.EXPIRING: {
          expiring = true;
          break;
        }
        case this.EXPIRED: {
          expired = true;
          break;
        }
      }
    });
    if (expired) {
      return this.EXPIRED;
    } else if (missing) {
      return this.MISSING;
    } else if (expiring) {
      return this.EXPIRING;
    } else {
      return this.ACTIVE;
    }
  }

  public getTrainingStatus(expires, missing, expiresSoonAlertDate: string) {
    if (missing) {
      return this.MISSING;
    } else if (expires) {
      const expiringDate = dayjs(expires);
      const currentDate = dayjs();
      const daysDifference = expiringDate.diff(currentDate, 'days');
      if (daysDifference < 0) {
        return this.EXPIRED;
      } else if (daysDifference >= 0 && daysDifference <= parseInt(expiresSoonAlertDate)) {
        return this.EXPIRING;
      }
    }
    return this.ACTIVE;
  }

  public trainingStatusForRecord(trainingRecord, expiresSoonAlertDate) {
    return this.getTrainingStatus(trainingRecord.expires, trainingRecord.missing, expiresSoonAlertDate);
  }

  public trainingStatusCount(training, status, expiresSoonAlertDate) {
    return training.filter((trainingRecord) => {
      return this.trainingStatusForRecord(trainingRecord, expiresSoonAlertDate) === status;
    }).length;
  }
}
