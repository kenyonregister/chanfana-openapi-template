import { D1ListEndpoint } from "chanfana";
import { HandleArgs } from "../../types";
import { EarningsCalendarModel } from "./models";

export class EarningsCalendarEndpoint extends D1ListEndpoint<HandleArgs> {
  _meta = {
    model: EarningsCalendarModel,
  };

  schema = {
    tags: ["Stocks"],
    summary: "Get earnings calendar",
    description: "Returns upcoming and past earnings events with estimates and actuals",
    operationId: "get-earnings-calendar",
  };

  searchFields = ["symbol", "company_name"];
  defaultOrderBy = "earnings_date DESC";
}
