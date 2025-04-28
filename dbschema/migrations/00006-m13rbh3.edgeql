CREATE MIGRATION m13rbh3xd7dexnrlbzpbk45ugob7hmbsq27rdd3a6vt77zrepqywaq
    ONTO m1ujelfj6ojyhmkptxcmadp4brtmgvommckhjfszyp4z35gjh7rl4a
{
  ALTER TYPE default::Entry {
      DROP LINK sessions;
  };
  ALTER TYPE default::Session {
      ALTER LINK entry {
          ON TARGET DELETE DELETE SOURCE;
      };
  };
};
