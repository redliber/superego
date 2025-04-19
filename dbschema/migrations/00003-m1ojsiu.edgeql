CREATE MIGRATION m1ojsiusdvl4muigav4o5pxhqqedgwrhfdkkhsekyv42g3levcuioa
    ONTO m1rrgl4dgy5ggakhzsitaoplnmqxjrfy4ae7vnuczqpcafedeojkha
{
  CREATE SCALAR TYPE default::SessionType EXTENDING enum<work, break>;
  ALTER TYPE default::Entry {
      ALTER LINK sessions {
          CREATE ANNOTATION std::title := 'Sessions associated with this entry';
          DROP CONSTRAINT std::exclusive;
      };
      CREATE REQUIRED PROPERTY entryEfficiency: std::int16 {
          SET default := 5;
          CREATE ANNOTATION std::title := 'Efficiency score (1-10) for the entry';
          CREATE CONSTRAINT std::max_value(10);
          CREATE CONSTRAINT std::min_value(1);
      };
      CREATE PROPERTY entryJournal: std::str {
          CREATE ANNOTATION std::title := 'Reflection paragraph for the entry';
      };
      CREATE REQUIRED PROPERTY entryName: std::str {
          SET default := 'Pomodoro Entry';
          CREATE ANNOTATION std::title := 'Name of the Pomodoro entry';
      };
      ALTER PROPERTY entryTime {
          CREATE ANNOTATION std::title := 'Start time of the Pomodoro entry';
      };
  };
  ALTER TYPE default::Session {
      CREATE REQUIRED PROPERTY sessionIndex: std::int32 {
          SET default := 0;
          CREATE ANNOTATION std::title := 'Order of the session within the entry';
      };
      CREATE INDEX ON (.sessionIndex);
      CREATE INDEX ON (.sessionTime);
      CREATE LINK entry: default::Entry {
          CREATE ANNOTATION std::title := 'Entry this session belongs to';
      };
      CREATE REQUIRED PROPERTY sessionDuration: std::duration {
          SET default := (<std::duration>'25 minutes');
          CREATE ANNOTATION std::title := 'Duration of the session';
      };
      ALTER PROPERTY sessionTime {
          CREATE ANNOTATION std::title := 'Start time of the session';
      };
      CREATE REQUIRED PROPERTY sessionType: default::SessionType {
          SET default := 'work';
          CREATE ANNOTATION std::title := 'Type of session (work or break)';
      };
  };
};
