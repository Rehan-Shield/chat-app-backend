module.exports = class ApiFeatures {
  constructor(query, queryParams) {
    this.query = query;
    this.queryParams = queryParams;
  }

  search(fields) {
    const search = this.queryParams.search ?? "";

    this.query.find({
      $or: fields.map((field) => ({
        [field]: {
          $regex: search,
          $options: "i",
        },
      })),
    });

    return this;
  }

  filters() {
    const filteredFields = JSON.parse(
      JSON.stringify(this.queryParams).replace(
        /gt|gte|lt|lte/,
        (match) => `$${match}`,
      ),
    );

    const excludedFields = ["sort", "page", "limit", "select", "search"];

    excludedFields.forEach((field) => {
      delete filteredFields[field];
    });

    this.query.find(filteredFields);
    return this;
  }

  select() {
    const selectedFields = this.queryParams.select
      ? this.queryParams.select.split(",").join("")
      : "-__v";

    this.query.select(selectedFields);

    return this;
  }

  sort() {
    const sort = this.queryParams.sort
      ? this.queryParams.sort.split(",").join(" ")
      : {
          createdAt: "-1",
        };

    this.query.sort(sort);
    return this;
  }

  paginator() {
    let { page, limit } = this.queryParams;

    page = page * 1 ?? 1;
    limit = limit * 1 ?? 100;
    const skip = limit * (page - 1);

    this.query.skip(skip).limit(limit);
    return this;
  }
};
