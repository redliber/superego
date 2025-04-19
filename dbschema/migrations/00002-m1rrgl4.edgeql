CREATE MIGRATION m1rrgl4dgy5ggakhzsitaoplnmqxjrfy4ae7vnuczqpcafedeojkha
    ONTO m1qyvz5zaw5ogr4zbyuijkfa5onbseocu6sfgim6ajizqjuiikuk4a
{
  DROP TYPE default::Deck;
  ALTER TYPE default::Card {
      DROP PROPERTY back;
  };
  ALTER TYPE default::Card {
      DROP PROPERTY front;
  };
  ALTER TYPE default::Card {
      DROP PROPERTY order;
  };
  ALTER TYPE default::Card RENAME TO default::Session;
  CREATE TYPE default::Entry {
      CREATE REQUIRED PROPERTY entryTime: std::datetime {
          SET default := (std::datetime_current());
      };
      CREATE INDEX ON (.entryTime);
      CREATE MULTI LINK sessions: default::Session {
          CREATE CONSTRAINT std::exclusive;
      };
  };
  ALTER TYPE default::Session {
      CREATE REQUIRED PROPERTY sessionTime: std::datetime {
          SET default := (std::datetime_current());
      };
  };
};
