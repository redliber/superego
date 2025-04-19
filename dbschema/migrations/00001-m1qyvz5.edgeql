CREATE MIGRATION m1qyvz5zaw5ogr4zbyuijkfa5onbseocu6sfgim6ajizqjuiikuk4a
    ONTO initial
{
  CREATE FUTURE simple_scoping;
  CREATE TYPE default::Card {
      CREATE REQUIRED PROPERTY back: std::str;
      CREATE REQUIRED PROPERTY front: std::str;
      CREATE REQUIRED PROPERTY order: std::int64;
  };
  CREATE TYPE default::Deck {
      CREATE MULTI LINK cards: default::Card {
          ON TARGET DELETE ALLOW;
          CREATE CONSTRAINT std::exclusive;
      };
      CREATE PROPERTY description: std::str;
      CREATE REQUIRED PROPERTY name: std::str;
  };
};
