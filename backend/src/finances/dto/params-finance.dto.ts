import { Matches, ValidateIf } from 'class-validator';

const regex = /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

export class ParamsFinanceDto {
  @ValidateIf(obj => obj.end !== undefined)
  @Matches(regex, {
    message: "Invalid date format in 'initial' filed. Example: 2024-05-01",
  })
  readonly initial: string;

  @ValidateIf(obj => obj.initial !== undefined)
  @Matches(regex, {
    message: "Invalid date format in 'end' field. Example: 2024-05-01",
  })
  readonly end: string;
}
