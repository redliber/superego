CREATE MIGRATION m1vd4uirxbg7he4dqxxql53emysx4ptlc3agw3x2cnflx7gqatpjra
    ONTO m1ojsiusdvl4muigav4o5pxhqqedgwrhfdkkhsekyv42g3levcuioa
{
  ALTER TYPE default::Entry {
      ALTER PROPERTY entryEfficiency {
          SET default := 4;
      };
  };
};
