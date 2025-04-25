CREATE MIGRATION m1ujelfj6ojyhmkptxcmadp4brtmgvommckhjfszyp4z35gjh7rl4a
    ONTO m1vd4uirxbg7he4dqxxql53emysx4ptlc3agw3x2cnflx7gqatpjra
{
  ALTER TYPE default::Entry {
      ALTER LINK sessions {
          ON SOURCE DELETE DELETE TARGET;
      };
  };
  ALTER TYPE default::Session {
      ALTER LINK entry {
          ON TARGET DELETE ALLOW;
      };
  };
};
